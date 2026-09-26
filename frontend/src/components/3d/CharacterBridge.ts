// Thin bridge so Dashboard (and other non-3D files) can import character types
// without pulling in Three.js at module-parse time.
export type { CharacterType } from './CartoonCharacters';

import {
  FairyCartoon, DragonCartoon, UnicornCartoon,
  WizardCartoon, PhoenixCartoon, RobotCartoon,
  DoraemonCartoon, DoraCartoon, ShinChanCartoon,
  JackieChanCartoon, SpidermanCartoon, SupermanCartoon,
} from './CartoonCharacters';

export const CHAR_MAP_SAFE: Record<string, React.ComponentType<{ position: [number,number,number] }>> = {
  fairy:     FairyCartoon,
  dragon:    DragonCartoon,
  unicorn:   UnicornCartoon,
  wizard:    WizardCartoon,
  phoenix:   PhoenixCartoon,
  robot:     RobotCartoon,
  doraemon:  DoraemonCartoon,
  dora:      DoraCartoon,
  shinchan:  ShinChanCartoon,
  jackie:    JackieChanCartoon,
  spiderman: SpidermanCartoon,
  superman:  SupermanCartoon,
};
