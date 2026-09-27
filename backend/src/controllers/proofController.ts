import { Response } from 'express';
import { fetchGithubCommits } from '../utils/github';
import Proof from '../models/Proof';
import Goal from '../models/Goal';
import User from '../models/User';
import Achievement from '../models/Achievement';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/cloudinary';
import { createNotification } from '../utils/notification';
import { BADGES, calculateLevel } from '../utils/xp';

export const submitProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalId, type, description, githubUsername, githubRepo, githubBranch } = req.body;

    const goal = await Goal.findOne({ _id: goalId, userId: req.userId, status: 'active' });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Active goal not found.' });
      return;
    }

    // Check if proof already pending
    const existing = await Proof.findOne({ goalId, userId: req.userId, status: 'pending' });
    if (existing) {
      res.status(409).json({ success: false, message: 'A proof is already pending for this goal.' });
      return;
    }

    const proofData: Record<string, unknown> = {
      goalId,
      userId: req.userId,
      type,
      description,
    };

    if (type === 'github') {
      // Verify via GitHub API
      try {
        const branch = githubBranch || 'main';
        const commits = await fetchGithubCommits({
          owner: githubUsername,
          repo: githubRepo,
          sha: branch,
          per_page: 10,
        });

        const since = new Date(goal.createdAt);
        const recentCommits = commits.filter(
          (c) => new Date(c.commit.author?.date || '') >= since
        );

        proofData.githubData = {
          username: githubUsername,
          repo: githubRepo,
          branch,
          commitCount: recentCommits.length,
          lastCommitDate: commits[0]?.commit?.author?.date
            ? new Date(commits[0].commit.author.date)
            : new Date(),
          commitUrl: commits[0]?.html_url || `https://github.com/${githubUsername}/${githubRepo}`,
        };

        // Auto-verify if commits exist
        if (recentCommits.length > 0) {
          proofData.status = 'verified';
        }
      } catch (ghErr) {
        res.status(400).json({
          success: false,
          message: 'Could not verify GitHub repository. Check username, repo and branch.',
        });
        return;
      }
    } else if (type === 'photo') {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Photo proof requires an image upload.' });
        return;
      }
      try {
        const { url, publicId } = await uploadImage(req.file.buffer, 'focusforge/proofs');
        proofData.imageUrl = url;
        proofData.imagePublicId = publicId;
      } catch {
        // If cloudinary not configured, use placeholder
        proofData.imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64').slice(0, 50)}...`;
        proofData.imagePublicId = `local_${Date.now()}`;
      }
    }

    const proof = await Proof.create(proofData);

    // Auto-verify manual proof
    if (type === 'manual' && description && description.length >= 20) {
      proof.status = 'verified';
      proof.verifiedAt = new Date();
      await proof.save();
    }

    await createNotification(
      req.userId!,
      'proof_submitted',
      '📸 Proof Submitted',
      `Your proof for "${goal.title}" has been submitted.`,
      { goalId, proofId: proof._id }
    );

    res.status(201).json({ success: true, proof });
  } catch (err) {
    console.error('Submit proof error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getProofs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalId, status } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (goalId) filter.goalId = goalId;
    if (status) filter.status = status;

    const proofs = await Proof.find(filter).sort({ submittedAt: -1 }).populate('goalId', 'title category');
    res.json({ success: true, proofs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const verifyProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    const proof = await Proof.findById(req.params.id).populate<{ goalId: typeof Goal.prototype }>('goalId');
    if (!proof) {
      res.status(404).json({ success: false, message: 'Proof not found.' });
      return;
    }

    // For demo, self-verify own proofs
    if (proof.userId.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Not authorized.' });
      return;
    }

    proof.status = status;
    proof.verifiedAt = new Date();
    if (status === 'rejected' && rejectionReason) proof.rejectionReason = rejectionReason;
    await proof.save();

    if (status === 'verified') {
      const goal = await Goal.findById(proof.goalId);
      if (goal) {
        goal.progress = Math.min(goal.progress + 25, 100);
        await goal.save();
      }

      const user = await User.findById(req.userId);
      if (user) {
        user.xp += 30;
        user.level = calculateLevel(user.xp);
        await user.save();

        // Check GitHub warrior badge
        const githubProofCount = await Proof.countDocuments({
          userId: req.userId,
          type: 'github',
          status: 'verified',
        });
        if (githubProofCount >= 3) {
          const existing = await Achievement.findOne({ userId: req.userId, badgeId: 'github_warrior' });
          if (!existing) {
            const badge = BADGES.find((b) => b.badgeId === 'github_warrior');
            if (badge) {
              await Achievement.create({ userId: req.userId, ...badge });
              await createNotification(
                req.userId!,
                'achievement_unlocked',
                '💻 Achievement Unlocked!',
                `You earned "${badge.name}"! +${badge.xpReward} XP`
              );
            }
          }
        }
      }

      await createNotification(
        req.userId!,
        'proof_verified',
        '✅ Proof Verified!',
        'Your proof has been verified. Great work! +30 XP'
      );
    } else {
      await createNotification(
        req.userId!,
        'proof_rejected',
        '❌ Proof Needs Revision',
        rejectionReason || 'Your proof was not accepted. Try again with better evidence.'
      );
    }

    res.json({ success: true, proof });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
