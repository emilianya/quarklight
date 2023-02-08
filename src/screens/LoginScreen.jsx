import poweredBy from "../assets/poweredby.png";
import {useState} from "react";

async function attemptLogin(e, loginState, tokenState, screenState) {
	screenState.setProcessing(true);
	e.preventDefault();
	let res = await fetch("https://lq.litdevs.org/v1/auth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			email: document.getElementsByName("email")[0].value,
			password: document.getElementsByName("password")[0].value
		})
	})
	let data = await res.json();
	screenState.setProcessing(false)
	if (data.request.success) {
		tokenState.setToken(data.response.access_token);
		loginState.setIsLoggedIn(true);
	} else {
		screenState.setError(`Login failed. Please try again.\n${data.response.message}`);
	}
}

export function LoginScreen(props) {
	let [error, setError] = useState(false);
	let [processing, setProcessing] = useState(false);
	return (
		<div className="screenRoot">
			<form className="centerModal" onSubmit={(e) => attemptLogin(e, props.loginState, props.tokenState, {error, setError, setProcessing, processing})}>
				<p>Welcome back! Please log in using LITauth.</p>
				<input className="input-box" placeholder="Email" type="email" name="email" required/>
				<input className="input-box" placeholder="Password" type="password" name="password" required/><br/>
				<input type="submit" className="button" disabled={processing} value={processing ? "..." : "Log in"}></input>
				<p style={{color:"red"}}>{error}</p>
			</form>
			<div style={{bottom:0,position:"absolute"}}>
				<img src={poweredBy} width="156px" alt="Powered by LITauth"/>
			</div>
		</div>
	);
}