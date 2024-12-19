import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import ProjectEditor from './ProjectEditor';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New project
            </button>
            <Overlay visible={newVisible()}>
                <ProjectEditor
                    submit={(name, loading) =>
                        withQuery(
                            () => actions.projects.create.orThrow({ name }),
                            loading,
                            true,
                            (id) => (location.href = `/projects/${id}`)
                        )
                    }
                />
            </Overlay>
        </>
    );
}
