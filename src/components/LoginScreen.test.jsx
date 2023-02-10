import dotenv from 'dotenv';
dotenv.config();
import { render, screen, act, fireEvent } from '../misc/test-utils';
import '@testing-library/jest-dom'
import {LoginScreen} from './LoginScreen';
import {AppContext} from '../contexts/AppContext';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// If this one fails something is SUPER wrong...
test('Login root exists', async () => {
	render(<LoginScreen />);
	const screenRoot = await screen.findByTestId("screenRoot");
	expect(screenRoot).toBeInTheDocument();
});

test('Login form exists', async () => {
	render(<LoginScreen />);
	const loginForm = await screen.findByTestId("loginForm");
	expect(loginForm).toBeInTheDocument();
	expect(loginForm.children).toHaveLength(6);
});

test("Login works", async () => {
	// Mock context
	let setLoading = jest.fn();
	let setToken = jest.fn();
	let setLoggedIn = jest.fn();

	render(<AppContext.Provider value={{setLoading, setToken, setLoggedIn}}>
		<LoginScreen />
	</AppContext.Provider>);
	const emailInput = await screen.findByTestId("emailInput");
	const passwordInput = await screen.findByTestId("passwordInput");
	const submitButton = await screen.findByTestId("submitButton");
	expect(emailInput).toBeInTheDocument();
	expect(passwordInput).toBeInTheDocument();
	expect(submitButton).toBeInTheDocument();
	expect(submitButton).toHaveValue("Log in");
	expect(submitButton).not.toBeDisabled();
	fireEvent.change(emailInput, {target: {value: process.env.TESTUSER}});
	fireEvent.change(passwordInput, {target: {value: process.env.TESTPASS}});
	expect(emailInput.value).toBe(process.env.TESTUSER);
	expect(passwordInput.value).toBe(process.env.TESTPASS);
	await act(async () => {
		submitButton.click();
	});
	expect(submitButton).toHaveValue("...");
	expect(submitButton).toBeDisabled();

	await act(async () => {
		await sleep(1000);
	});
	expect(submitButton).toHaveValue("Log in");
	expect(submitButton).not.toBeDisabled();

	const errorText = await screen.findByTestId("errorText");
	expect(errorText.textContent).toHaveLength(0)

	expect(setLoading).toHaveBeenCalledTimes(1);
	expect(setLoading).toHaveBeenCalledWith(true);
	expect(setToken).toHaveBeenCalledTimes(1);
	expect(setToken).toHaveBeenCalledWith(expect.any(String));
	expect(setLoggedIn).toHaveBeenCalledTimes(1);
	expect(setLoggedIn).toHaveBeenCalledWith(true);
})
