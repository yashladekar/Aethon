export interface WeaknessSignal {
  topicId: string;
  conceptKey: string;
  severity: number;
  hesitationMs?: number;
}

export interface RevisionCandidate {
  topicId: string;
  reason: string;
  dueAt: Date;
  priority: number;
}
