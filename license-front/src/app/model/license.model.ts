import { FeatureModel } from './feature.model';

export class LicenseModel {
  id ? = 0;
  name? = '';
  fullText? = '';
  canFeatureTags: FeatureModel[] = [];
  cannotFeatureTags: FeatureModel[] = [];
  mustFeaturesTags: FeatureModel[] = [];
  quickSummery? = '';

  constructor() {}

}
