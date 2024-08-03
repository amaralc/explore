import { IThemeSettingsRepository } from '../repository';

export interface ICustomThemeProviderProps {
  children: React.ReactNode;
  settingsRepository: IThemeSettingsRepository;
}
