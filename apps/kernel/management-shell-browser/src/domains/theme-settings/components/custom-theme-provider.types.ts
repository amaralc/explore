import { IThemeSettingsRepository } from '../repository';

export interface ICustomThemeProviderProps {
  children: React.ReactNode;
  themeSettingsRepository: IThemeSettingsRepository;
}
