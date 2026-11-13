import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getSelectedVoiceEngine, toOutputFormatOptions } from '../../shared/voice';

export async function getCastVoiceOutputFormats(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return toOutputFormatOptions(await getSelectedVoiceEngine.call(this, 'castvoice'));
}
