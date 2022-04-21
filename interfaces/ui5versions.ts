export interface Ui5Version {
  versions: Version[];
  patches: Patch[];
}

interface Patch {
  version: string;
  eocp: string;
  removed?: boolean;
}

interface Version {
  version: string;
  version_label?: string;
  support: string;
  lts: boolean;
  eom: string;
  eocp: string;
  sapuiversion: string;
  frontendserver: string;
  beta?: string[];
}
