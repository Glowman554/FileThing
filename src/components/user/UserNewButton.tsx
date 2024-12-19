import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import UserEditor from './UserEditor';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New user
            </button>
            <Overlay visible={newVisible()}>
                <UserEditor
                    submit={(username, password, administrator, loading) =>
                        withQuery(
                            () => actions.users.create.orThrow({ username, password, administrator }),
                            loading,
                            true,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
