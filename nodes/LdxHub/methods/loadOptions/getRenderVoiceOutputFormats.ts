import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getSelectedVoiceEngine, toOutputFormatOptions } from '../../shared/voice';

export async function getRenderVoiceOutputFormats(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return toOutputFormatOptions(await getSelectedVoiceEngine.call(this, 'rendervoice'));
}
