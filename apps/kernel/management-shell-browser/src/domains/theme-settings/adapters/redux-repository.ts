import { useAppSelector } from '../../../redux-store';
import { IThemeSettingsRepository } from '../repository';

export const reduxThemeSettingsRepository: IThemeSettingsRepository = {
  useThemeSettings: () => useAppSelector((state) => state.themeSettings),
};
