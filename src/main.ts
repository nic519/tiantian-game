import './styles.css';
import {Session} from './game/session.ts';
import {GameUI} from './game/ui.ts';
const session=new Session();const ui=new GameUI(document.querySelector('#app')!,session);void ui.start();
