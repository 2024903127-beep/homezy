import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), '.platform-settings.json');

const DEFAULTS: Record<string, unknown> = {
  autoDispatch: true,
  maxDispatchRadiusKm: 15,
  providerAcceptTimeoutSecs: 45,
  maxJobsPerProvider: 3,
  platformCommissionPct: 15,
  minProviderPayoutThreshold: 500,
  cancellationFeeAfterDispatch: 100,
  supportPhone: '',
  supportWhatsappUrl: '',
  activeCities: 'Delhi NCR',
  maintenanceMode: false,
};

@Injectable()
export class AdminSettingsService {
  private settings: Record<string, unknown> = { ...DEFAULTS };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
        this.settings = { ...DEFAULTS, ...JSON.parse(raw) };
      }
    } catch {
      this.settings = { ...DEFAULTS };
    }
  }

  private save() {
    try {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch { /* non-fatal */ }
  }

  getAll() {
    return this.settings;
  }

  update(patch: Record<string, unknown>) {
    this.settings = { ...this.settings, ...patch };
    this.save();
    return this.settings;
  }
}
