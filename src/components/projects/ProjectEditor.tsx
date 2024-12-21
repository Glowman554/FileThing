import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import { createSignal, useContext } from 'solid-js';
import type { PartialProject, Project } from '../../actions/projects';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';

export type Props = {
    submit: (name: string, loading: LoadingInterface) => void;
};

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal('');

    const submit = () => {
        props.submit(name(), loading);
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <table>
                <tbody>
                    <tr>
                        <td class="text-nowrap pr-2">Name</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={name()}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <div class="center">
                <button class="button" type="submit">
                    Create
                </button>
            </div>
        </form>
    );
}

export default function ProjectEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function ProjectEditorButtons(props: { project: PartialProject }) {
    return (
        <DeleteButton
            callback={(id, loading) =>
                withQuery(
                    () => actions.projects.delete.orThrow({ id }),
                    loading,
                    false,
                    () => location.reload()
                )
            }
            id={props.project.id}
        />
    );
}
