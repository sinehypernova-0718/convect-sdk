import { mergeConfig } from 'vitest/config';
import base from '../../vitest.base.ts';

export default mergeConfig(base, {
	test: {
		name: '@convect/protocol',
	},
});
