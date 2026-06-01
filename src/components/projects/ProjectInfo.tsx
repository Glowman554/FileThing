import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import UserOnly from '../UserOnly';
import Query, { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import { untrack } from 'solid-js/web';
import { createSignal, useContext } from 'solid-js';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import type { File } from '../../actions/files';
import { QueryContext } from '@glowman554/base-components/src/query/QueryController';
import UploadButton from './UploadButton';

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

function ClearProjectButton(props: { projectId: string }) {
    const [clearProjectVisible, setClearProjectVisible] = createSignal(false);
    const loading = useContext(LoadingContext);

    return (
        <>
            <button class="ml-4 rounded-sm bg-red-600 p-2" onClick={() => setClearProjectVisible(true)}>
                Clear project files
            </button>
            <Overlay visible={clearProjectVisible()} reset={() => setClearProjectVisible(false)}>
                <div class="field">
                    <div class="center">
                        <h1>Are you sure you want to clear all files from this project?</h1>
                    </div>

                    <div class="center">
                        <button class="button" onClick={() => setClearProjectVisible(false)}>
                            Close
                        </button>
                        <button
                            class="button !bg-red-600"
                            onClick={() =>
                                withQuery(
                                    () => actions.projects.clearFiles.orThrow({ id: props.projectId }),
                                    loading,
                                    true,
                                    () => {
                                        location.reload();
                                    }
                                )
                            }
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </Overlay>
        </>
    );
}

function Wrapped(props: Props) {
    const [tokenVisible, setTokenVisible] = createSignal(false);
    return (
        <Query f={() => actions.projects.load.orThrow({ id: untrack(() => props.id) })} queryKey="file-list">
            {(project) => (
                <div>
                    <h1 class="text-3xl">{project.name}</h1>
                    <br />
                    <div class="flex justify-between">
                        <div>
                            <button class="rounded-sm bg-neutral-600 p-2" onClick={() => setTokenVisible(true)}>
                                Show token
                            </button>
                            <ClearProjectButton projectId={project.id} />
                        </div>
                        <div>
                            <UploadButton
                                token={project.projectToken}
                                callback={(url) => {
                                    console.log(url);
                                    location.reload();
                                }}
                            />
                        </div>
                    </div>

                    <Overlay visible={tokenVisible()} reset={() => setTokenVisible(false)}>
                        <div class="field">
                            <div class="overflow-x-scroll bg-neutral-600 p-4">{project.projectToken}</div>
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
                                        <td class="font-bold max-sm:hidden">File ID</td>
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
                                            <td class="max-sm:hidden">{file.id}</td>
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
