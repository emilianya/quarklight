import poweredBy from "../../assets/poweredby.png";
import {useState, useContext} from "react";
import {AppContext} from "../../contexts/AppContext";
import {lq} from "../../classes/Lightquark";


export function LoginScreen(props) {
	let [error, setError] = useState(false);
	let [processing, setProcessing] = useState(false);
	let appContext = useContext(AppContext);

	/**
	 * Log in
	 * @param e{FormEvent<HTMLFormElement>}
	 * @returns {Promise<void>}
	 */
	async function attemptLogin(e) {
		// Set processing to true to indicate loading on button
		setProcessing(true);
		e.preventDefault();

		// Send credentials to API
		let data = await lq.login(
			document.querySelector("input[name=email]").value,
			document.querySelector("input[name=password]").value
		)

		// Long operation over, remove indicator
		setProcessing(false)
		if (data.request.success) {
			// Show loading spinner while app opens
			appContext.setLoading(true);
			appContext.setToken(data.response.access_token);
			appContext.setLoggedIn(true);
		} else {
			setError(`Login failed. Please try again.\n${data.response.message}`);
		}
	}

	return (
		<div className="screenRoot" data-testid="screenRoot">
			<form data-testid="loginForm" className="centerModal" onSubmit={(e) => attemptLogin(e)}>
				<p>Welcome back! Please log in using LITauth.</p>
				<input className="input-box" data-testid="emailInput" placeholder="Email" type="email" name="email" required/>
				<input className="input-box" data-testid="passwordInput" placeholder="Password" type="password" name="password" required/><br/>
				<input type="submit" data-testid="submitButton" className="button" disabled={processing} value={processing ? "..." : "Log in"}></input>
				<p style={{color:"red"}} data-testid="errorText">{error}</p>
			</form>
			<div style={{bottom:0,position:"absolute"}}>
				<img src={poweredBy} width="156px" alt="Powered by LITauth"/>
			</div>
		</div>
	);
}