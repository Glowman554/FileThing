import Loading from '@glowman554/base-components/src/loading/Loading';
import UserOnly from '../UserOnly';
import Query, { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { untrack } from 'solid-js/web';
import { createSignal } from 'solid-js';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import type { File } from '../../actions/files';

export interface Props {
    id: string;
}

export function FileEditorButtons(props: { file: File }) {
    return (
        <DeleteButton
            callback={(id, loading) =>
                withQuery(
                    () => actions.files.delete.orThrow({ id }),
                    loading,
                    false,
                    () => location.reload()
                )
            }
            id={props.file.id}
        />
    );
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

                    <table>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>File ID</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <Query f={() => actions.files.loadAll.orThrow({ projectId: project.id })}>
                                {(files) =>
                                    files.map((file) => (
                                        <tr>
                                            <td>{file.name}</td>
                                            <td>{file.id}</td>
                                            <td>
                                                <FileEditorButtons file={file} />
                                            </td>
                                        </tr>
                                    ))
                                }
                            </Query>
                        </tbody>
                    </table>
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
