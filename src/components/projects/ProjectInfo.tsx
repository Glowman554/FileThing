import Loading from '@glowman554/base-components/src/loading/Loading';
import UserOnly from '../UserOnly';
import Query, { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { untrack } from 'solid-js/web';
import { createSignal, useContext } from 'solid-js';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import type { File } from '../../actions/files';
import { QueryContext } from '@glowman554/base-components/src/query/QueryController';

export interface Props {
    id: string;
}

export function FileEditorButtons(props: { file: File }) {
    const query = useContext(QueryContext);
    return (
        <DeleteButton
            callback={(id, loading) =>
                withQuery(
                    () => actions.files.delete.orThrow({ id }),
                    loading,
                    false,
                    () => query.refetch('file-list')
                )
            }
            id={props.file.id}
        />
    );
}

function Wrapped(props: Props) {
    const [tokenVisible, setTokenVisible] = createSignal(false);
    return (
        <Query f={() => actions.projects.load.orThrow({ id: untrack(() => props.id) })} queryKey="file-list">
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
                    <Query f={() => actions.files.loadAll.orThrow({ projectId: project.id })}>
                        {(files) => (
                            <table class="w-full">
                                <thead>
                                    <tr>
                                        <td class="font-bold">File Name</td>
                                        <td class="font-bold">File ID</td>
                                        <td></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr>
                                            <td>
                                                <a class="underline" href={file.url}>
                                                    {file.name}
                                                </a>
                                            </td>
                                            <td>{file.id}</td>
                                            <td>
                                                <FileEditorButtons file={file} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Query>
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
