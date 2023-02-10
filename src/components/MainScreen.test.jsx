import dotenv from 'dotenv';
dotenv.config();
import { render, screen, act, fireEvent } from '../misc/test-utils';
import '@testing-library/jest-dom'
import {MainScreen} from './MainScreen';
import {AppContext} from '../contexts/AppContext';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// If this one fails something is SUPER wrong...
test('Screen root exists', async () => {
	render(<MainScreen />);
	const screenRoot = await screen.findByTestId("screenRoot");
	expect(screenRoot).toBeInTheDocument();
});

