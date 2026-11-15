export type BookmakerId = 'SportyBet' | 'Bet9ja' | '1xBet' | 'MSport' | 'BetKing';

export interface Bookmaker {
  id: BookmakerId;
  name: string;
  codePrefix: string;
  badgeColor: string;
  accentColor: string;
  logoLetter: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type MarketType = '1X2' | 'DOUBLE_CHANCE' | 'OVER_UNDER' | 'BTTS' | 'OTHER';

export interface AlternativeOption {
  marketName: string;
  selection: string;
  odds: number;
  riskLevel: 'LOW' | 'MEDIUM';
  reason: string;
}

export interface BetLeg {
  id: string;
  league: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  marketType: MarketType;
  marketName: string;
  selection: string;
  odds: number;
  originalOdds: number;
  riskLevel: RiskLevel;
  riskReason: string;
  isConvertedToDoubleChance?: boolean;
  alternative?: AlternativeOption;
  targetMarketName?: string;
  targetSelection?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionTaken?: string;
  isDemoMode?: boolean;
  fixtureSource?: 'live-api' | 'cached-fixtures';
}

export interface SlipPreset {
  code: string;
  source: BookmakerId;
  label: string;
  legs: BetLeg[];
}

export interface AiSlipRequest {
  prompt: string;
  currentLegs: BetLeg[];
  stake: number;
}

export interface AiSlipResponse {
  updatedLegs: BetLeg[];
  updatedStake?: number;
  aiSummary: string;
  isDemoMode?: boolean;
  fixtureSource?: 'live-api' | 'cached-fixtures';
}

export interface BookingCodeRequest {
  action: 'load' | 'export';
  code?: string;
  sourceBookmaker: BookmakerId;
  targetBookmaker: BookmakerId;
  legs?: BetLeg[];
}

export interface BookingCodeResponse {
  success: boolean;
  legs: BetLeg[];
  targetCode: string;
  isLiveFetch: boolean;
  sourceBookmaker: BookmakerId;
  targetBookmaker: BookmakerId;
  message: string;
  bookmakerNotice?: string;
}

export interface SavedSlip {
  id: string;
  title: string;
  sourceBookmaker: BookmakerId;
  targetBookmaker: BookmakerId;
  bookingCode: string;
  targetBookingCode: string;
  legs: BetLeg[];
  totalOdds: number;
  stake: number;
  survivalScore: number;
  timestamp: string;
}
