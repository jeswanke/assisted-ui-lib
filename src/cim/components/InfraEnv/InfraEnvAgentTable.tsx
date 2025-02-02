import * as React from 'react';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import {
  discoveryTypeColumn,
  statusColumn,
  clusterColumn,
  useAgentsTable,
} from '../Agent/tableUtils';
import { AgentTableEmptyState } from '../Agent/AgentTable';
import HostsTable from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';

type InfraEnvAgentTable = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string;
  className?: string;
};

const InfraEnvAgentTable: React.FC<InfraEnvAgentTable> = ({
  agents,
  className,
  getClusterDeploymentLink,
  ...actions
}) => {
  const [hosts, hostActions, actionResolver] = useAgentsTable(actions, agents);
  const content = React.useMemo(
    () => [
      hostnameColumn(hostActions.onEditHost),
      discoveryTypeColumn(agents),
      statusColumn(agents, actions.onEditHost, actions.onApprove),
      clusterColumn(agents, getClusterDeploymentLink),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [agents, actions, getClusterDeploymentLink, hostActions],
  );
  return (
    <HostsTable
      hosts={hosts}
      content={content}
      actionResolver={actionResolver}
      className={className}
    >
      <AgentTableEmptyState />
    </HostsTable>
  );
};

export default InfraEnvAgentTable;
