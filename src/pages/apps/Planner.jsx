import { AgendaTabs } from './Agenda';
import Tutorial, { useTutorial } from '../../components/Tutorial';

export default function Planner() {
  const { show: showTuto, close: closeTuto, reset: resetTuto } = useTutorial('planner');
  return <AgendaTabs appTitle="Planner" appIcon="🗓" hideVentes={true} />;
}
