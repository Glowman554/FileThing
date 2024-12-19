import Loading from '@glowman554/base-components/src/loading/Loading';
import UserOnly from '../UserOnly';
import Query from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { untrack } from 'solid-js/web';
import { createSignal } from 'solid-js';
import Overlay from '@glowman554/base-components/src/generic/Overlay';

export interface Props {
    id: string;
}

function Wrapped(props: Props) {
    const [tokenVisible, setTokenVisible] = createSignal(false);
    return (
        <Query f={() => actions.projects.load.orThrow({ id: untrack(() => props.id) })}>
            {(project) => (
                <div>
                    <h1 class="text-3xl">{project.name}</h1>
                    <button class="rounded-sm bg-slate-600 p-2" onClick={() => setTokenVisible(true)}>
                        Show token
                    </button>
                    <Overlay visible={tokenVisible()}>
                        <div class="field">
                            <div class="overflow-x-scroll bg-slate-300 p-4">{project.projectToken}</div>
                            <div class="center">
                                <button class="button" onClick={() => setTokenVisible(false)}>
                                    Close
                                </button>
                                <button
                                    class="button"
                                    onClick={() => navigator.clipboard.writeText(project.projectToken)}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </Overlay>
                </div>
            )}
        </Query>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={false}>
            <UserOnly>
                <Wrapped {...props} />
            </UserOnly>
        </Loading>
    );
}
