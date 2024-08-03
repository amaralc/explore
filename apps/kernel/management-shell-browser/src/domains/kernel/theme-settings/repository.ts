import { IThemeSettings } from './types';

export interface IThemeSettingsRepository {
  useThemeSettings: () => IThemeSettings;
}
