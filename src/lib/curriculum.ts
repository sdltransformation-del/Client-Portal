export type CurriculumDay = {
  day: number
  type: 'video' | 'article'
  refId: string
  part?: { current: number; total: number; startMin: number; endMin: number }
}

export const CURRICULUM: CurriculumDay[] = [
  { day: 1,  type: 'article', refId: 'healthcentral-prt' },
  { day: 2,  type: 'video',   refId: 'pv8PtT_4rjk', part: { current: 1, total: 2, startMin: 0,   endMin: 25  } },
  { day: 3,  type: 'video',   refId: 'pv8PtT_4rjk', part: { current: 2, total: 2, startMin: 25,  endMin: 49  } },
  { day: 4,  type: 'video',   refId: '0VyH1laOd2M', part: { current: 1, total: 2, startMin: 0,   endMin: 27  } },
  { day: 5,  type: 'video',   refId: '0VyH1laOd2M', part: { current: 2, total: 2, startMin: 27,  endMin: 53  } },
  { day: 6,  type: 'article', refId: 'pt-chronic-pain-head' },
  { day: 7,  type: 'video',   refId: 'cbF2HMXtfZ4', part: { current: 1, total: 3, startMin: 0,   endMin: 46  } },
  { day: 8,  type: 'video',   refId: 'cbF2HMXtfZ4', part: { current: 2, total: 3, startMin: 46,  endMin: 92  } },
  { day: 9,  type: 'video',   refId: 'cbF2HMXtfZ4', part: { current: 3, total: 3, startMin: 92,  endMin: 138 } },
  { day: 10, type: 'article', refId: 'schubiner-pain-message' },
  { day: 11, type: 'video',   refId: 'gwd-wLdIHjs' },
  { day: 12, type: 'article', refId: 'painscience-mri' },
  { day: 13, type: 'video',   refId: 'Lw1D_UvzIDA' },
  { day: 14, type: 'video',   refId: 'fMwQsuPXODk' },
  { day: 15, type: 'article', refId: 'jensen1994' },
  { day: 16, type: 'video',   refId: 'tJmtnvCz_KU' },
  { day: 17, type: 'article', refId: 'schierling' },
  { day: 18, type: 'video',   refId: 'KGbE_uUVuRs' },
  { day: 19, type: 'article', refId: 'andrews2002' },
  { day: 20, type: 'article', refId: 'elbarzouhi2013' },
  { day: 21, type: 'article', refId: 'smithsonian-nocebo' },
  { day: 22, type: 'video',   refId: 'kYK7utae7Cg', part: { current: 1, total: 3, startMin: 0,   endMin: 39  } },
  { day: 23, type: 'video',   refId: 'kYK7utae7Cg', part: { current: 2, total: 3, startMin: 39,  endMin: 78  } },
  { day: 24, type: 'video',   refId: 'kYK7utae7Cg', part: { current: 3, total: 3, startMin: 78,  endMin: 116 } },
  { day: 25, type: 'article', refId: 'petersen2014' },
  { day: 26, type: 'video',   refId: 'I8GG7sFQ3xw' },
  { day: 27, type: 'video',   refId: 'MDDp6sqVG_k' },
  { day: 28, type: 'article', refId: 'hashmi2013' },
  { day: 29, type: 'video',   refId: 'ZOHPmp1Rd38', part: { current: 1, total: 2, startMin: 0,   endMin: 40  } },
  { day: 30, type: 'video',   refId: 'ZOHPmp1Rd38', part: { current: 2, total: 2, startMin: 40,  endMin: 79  } },
  { day: 31, type: 'article', refId: 'chou' },
  { day: 32, type: 'video',   refId: 'sRutceG1gks', part: { current: 1, total: 2, startMin: 0,   endMin: 26  } },
  { day: 33, type: 'video',   refId: 'sRutceG1gks', part: { current: 2, total: 2, startMin: 26,  endMin: 52  } },
  { day: 34, type: 'article', refId: 'ashar2022' },
  { day: 35, type: 'article', refId: 'psrt2021' },
  { day: 36, type: 'article', refId: 'nih-scale' },
  { day: 37, type: 'article', refId: 'deyo-overtreatment' },
  { day: 38, type: 'video',   refId: 'pHM45IXkXeM' },
]
