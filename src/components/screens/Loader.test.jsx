import { render, screen, act } from '../../misc/test-utils';
import '@testing-library/jest-dom'
import {Loader} from './Loader';
const sleep = ms => new Promise(r => setTimeout(r, ms));
// If this one fails something is SUPER wrong...
test('Loader root exists', async () => {
	render(<Loader />);
	const loaderRoot = await screen.findByTestId("loaderRoot");
	expect(loaderRoot).toBeInTheDocument();
});


test('Spinner root exists', async () => {
	render(<Loader />);
	const spinner = await screen.findByTestId("spinner");
	expect(spinner).toBeInTheDocument();
});

test('Spinner subtitle exists', async () => {
	render(<Loader />);
	const subtitle = await screen.findByTestId("spinnerSubtitle");
	expect(subtitle).toBeInTheDocument();
});

test('Spinner starts with expected text', async () => {
	render(<Loader />);
	const subtitle = await screen.findByTestId("spinnerSubtitle");
	expect(subtitle).toHaveTextContent(/^(Loading\.\.\.)|(Loading user data\.\.\.)|(Connecting to gateway\.\.\.)/);
});

test('Spinner has more dots after time', async () => {
	render(<Loader />);
	const subtitle = await screen.findByTestId("spinnerSubtitle");
	await act(async () => {
		await sleep(1000)
	});
	console.log(subtitle.textContent);
	expect(subtitle).toHaveTextContent(/(^Loading\.\.\.\.$)|(^Loading user data\.\.\.\.$)|(^Connecting to gateway\.\.\.\.$)/);
});