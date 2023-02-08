import {useEffect, useState} from "react";

export function MainScreen(props) {
	let [userData, setUserData] = useState(undefined);
	useEffect(() => {
		async function getUserData() {
			let res = await fetch("https://lq.litdevs.org/v1/user/me", {
				headers: {
					"Authorization": `Bearer ${props.tokenState.getToken}`
				}
			})
			let data = await res.json();
			if (data.request.success) {
				setUserData(data.response.jwtData);
			}
		}
		getUserData();
	}, [props.tokenState.getToken])
	return (
		<div className="screenRoot">
			<p>You are {userData.username}</p>
			<p>Your email address is {userData.email}</p>
			<button onClick={() => props.loginState.setIsLoggedIn(false)}>Loggery Outtery</button>
		</div>
	);
}