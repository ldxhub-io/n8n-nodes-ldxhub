import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getVoiceEngines, toEngineOptions } from '../../shared/voice';

export async function getRenderVoiceEngines(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return toEngineOptions(await getVoiceEngines.call(this, 'rendervoice'));
}
