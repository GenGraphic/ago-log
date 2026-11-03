import type { Asset } from './assets';
import { AssetType, EntryType } from './enums';
import type { Entry } from './types';

/** What the user said they want to keep track of, in the first-run setup. */
export type SetupGoal = 'vehicle' | 'home' | 'documents' | 'subscriptions' | 'warranties';

export const SETUP_GOALS: SetupGoal[] = ['vehicle', 'home', 'documents', 'subscriptions', 'warranties'];

/** Goals that are things the user owns: the setup creates an asset for each. */
export const GOAL_ASSET_TYPE: Partial<Record<SetupGoal, AssetType>> = {
  vehicle: AssetType.VEHICLE,
  home: AssetType.HOME,
};

/** Entries every asset of a type should have, most important first. */
export const ASSET_SUGGESTIONS: Partial<Record<AssetType, EntryType[]>> = {
  [AssetType.VEHICLE]: [
    EntryType.CAR_INSURANCE,
    EntryType.CAR_INSPECTION,
    EntryType.VIGNETTE,
    EntryType.CAR_MAINTENANCE,
  ],
  [AssetType.HOME]: [EntryType.HOME_INSURANCE],
};

/** Entries suggested for the goals that are not tied to an asset. */
export const GOAL_SUGGESTIONS: Partial<Record<SetupGoal, EntryType[]>> = {
  documents: [EntryType.ID_CARD, EntryType.DRIVING_LICENSE, EntryType.PASSPORT],
  subscriptions: [EntryType.SUBSCRIPTION],
  warranties: [EntryType.WARRANTY],
};

/** Entry types with a title and explanation under `suggestions.types` in i18n. */
export type SuggestedType =
  | EntryType.CAR_INSURANCE
  | EntryType.CAR_INSPECTION
  | EntryType.VIGNETTE
  | EntryType.CAR_MAINTENANCE
  | EntryType.HOME_INSURANCE
  | EntryType.ID_CARD
  | EntryType.DRIVING_LICENSE
  | EntryType.PASSPORT
  | EntryType.SUBSCRIPTION
  | EntryType.WARRANTY;

export interface Suggestion {
  key: string;
  entryType: SuggestedType;
  assetId?: string;
  assetName?: string;
  done: boolean;
}

function linkedTypes(asset: Asset, entriesById: Map<string, Entry>): Set<EntryType> {
  const types = new Set<EntryType>();
  for (const e of asset.entries ?? []) {
    const entry = typeof e === 'string' ? entriesById.get(e) : e;
    if (entry) types.add(entry.entryType);
  }
  return types;
}

/** Suggestions for one asset; `done` once an entry of that type is linked to it. */
export function assetSuggestions(asset: Asset, entries: Entry[] = []): Suggestion[] {
  const types = linkedTypes(asset, new Map(entries.map((e) => [e.id, e])));
  return (ASSET_SUGGESTIONS[asset.type] ?? []).map((entryType) => ({
    key: `${asset.id}:${entryType}`,
    entryType: entryType as SuggestedType,
    assetId: asset.id,
    assetName: asset.name,
    done: types.has(entryType),
  }));
}

/**
 * The "getting started" checklist: suggestions for every asset the user
 * owns, plus the ones for the goals picked in the setup.
 */
export function checklist(goals: SetupGoal[], assets: Asset[], entries: Entry[]): Suggestion[] {
  const ownedTypes = new Set(entries.map((e) => e.entryType));
  const fromAssets = assets.flatMap((a) => assetSuggestions(a, entries));
  const fromGoals = goals.flatMap((goal) =>
    (GOAL_SUGGESTIONS[goal] ?? []).map((entryType) => ({
      key: `${goal}:${entryType}`,
      entryType: entryType as SuggestedType,
      done: ownedTypes.has(entryType),
    })),
  );
  return [...fromAssets, ...fromGoals];
}
