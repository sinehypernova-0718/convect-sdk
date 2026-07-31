import { mergeConfig } from 'vitest/config';
import base from '../../vitest.base';

export default mergeConfig(base, {
    test: {
        name: '@convect/sdk',
    },
});
