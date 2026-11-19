import { Link } from 'react-router-dom';
import { Compass, WifiOff } from 'lucide-react';
import { Empty } from '../components/ui.jsx';
export const NotFound = () => (<div className="wrap"><Empty icon={Compass} title="Page not found">That page doesn't exist.</Empty><Link className="btn primary" to="/">Back home</Link></div>);
export const OfflinePage = () => (<div className="wrap"><Empty icon={WifiOff} title="You're offline">Live campaign information needs a connection. Reconnect and try again.</Empty><button className="btn primary" onClick={() => location.reload()}>Retry</button></div>);
export default NotFound;
