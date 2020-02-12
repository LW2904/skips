import WebUntis from '../webuntis';
import { useState } from 'preact/hooks';

const Header = () => (
	<header>
		<h2>skips</h2>
	</header>
);

const UserInput = ({ onSubmit }) => {
	const [ username, setUsername ] = useState('weixlblau');
	const [ password, setPassword ] = useState('S3cure_unt1s');

	const handleSubmit = (e) => {
		e.preventDefault();

		onSubmit({ username, password });
	};

	return (<form onSubmit={handleSubmit}>
		<label>Benutzername</label>
		<input required type='text' value={username || undefined}
			onInput={({ target }) => setUsername(target.value)} />

		<label>Passwort</label>
		<input required type='password' value={password || undefined}
			onInput={({ target }) => setPassword(target.value)} />

		<button type='submit'>Einreichen</button>
	</form>);
};

const App = () => {
	const api = new WebUntis('borglinz');

	const onUserSubmit = async ({ username, password }) => {
		await api.authenticate(username, password);

		console.log('data last updated', await api.getUpdateDate());
	};

	return (<div id="app">
		<Header />

		<main>
			<aside>
				Exclusively relevant to students of the <a href='http://www.borglinz.at/'>BORG 
				Linz</a>. For contact information see <a href='https://fsoc.space'>fsoc.space</a>. 
			</aside>

			<p>
				Berechnet die relative Abwesenheit in Prozent der Gesamtstunden 
				(bis dato oder bis Schulende) mithilfe des {' '}
				<a href='https://erato.webuntis.com/WebUntis/?school=borglinz#/basic/main'>WebUntis</a> {' '}
				Dienstes. Ein funktionierendes Benutzerkonto auf jenem Dienst ist erforderlich.
			</p>

			<p>
				Die eingereichten Benutzerdaten verlassen den Browser nicht.
			</p>

			<p>
				<UserInput onSubmit={onUserSubmit} />
			</p>

			
		</main>

		<footer>
			<p>
				This service is not affiliated with BORG Linz or Untis GmbH.
			</p>
		</footer>
	</div>);
};

export default App;
