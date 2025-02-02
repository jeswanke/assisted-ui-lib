import React from 'react';
import { Host, HostNetworkingStatusComponentProps, HostStatus } from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = ({ cluster, ...props }) => {
  const networkingStatus: Host['status'] = 'discovering'; // TODO(mlibra)
  const validationsInfo: ValidationsInfo = {};
  const sublabel = undefined;

  const AdditionalNTPSourcesDialogToggleWithCluster = React.useCallback<React.FC>(
    () => <AdditionalNTPSourcesDialogToggle cluster={cluster} />,
    [cluster],
  );

  return (
    <HostStatus
      {...props}
      statusOverride={networkingStatus}
      validationsInfo={validationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleWithCluster}
    />
  );
};

export default NetworkingStatus;
