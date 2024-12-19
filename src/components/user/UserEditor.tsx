import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import { createSignal, Show, useContext } from 'solid-js';
import type { User } from '../../actions/authentication';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';

export type Props =
    | {
          initial?: undefined;
          submit: (username: string, password: string, administrator: boolean, loading: LoadingInterface) => void;
      }
    | {
          initial: User;
          submit: (username: string, administrator: boolean, loading: LoadingInterface) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [username, setUsername] = createSignal(props.initial?.username || '');
    const [initialPassword, setInitialPassword] = createSignal('');

    const [administrator, setAdministrator] = createSignal(props.initial?.administrator || false);

    const submit = () => {
        if (props.initial) {
            props.submit(username(), administrator(), loading);
        } else {
            props.submit(username(), initialPassword(), administrator(), loading);
        }
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
                        <td class="text-nowrap pr-2">Username</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="w-full"
                                value={username()}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={Boolean(props.initial)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="text-nowrap pr-2">
                            <label for="input-administrator">Administrator</label>
                        </td>
                        <td class="w-full">
                            <input
                                type="checkbox"
                                class="w-full"
                                id="input-administrator"
                                checked={administrator()}
                                onChange={(e) => setAdministrator(e.target.checked)}
                            />
                        </td>
                    </tr>
                    <Show when={!props.initial}>
                        <tr>
                            <td class="text-nowrap pr-2">Password</td>
                            <td class="w-full">
                                <input
                                    type="password"
                                    class="w-full"
                                    value={initialPassword()}
                                    onChange={(e) => setInitialPassword(e.target.value)}
                                    required
                                />
                            </td>
                        </tr>
                    </Show>
                </tbody>
            </table>

            <br />

            <div class="center">
                <button class="button" type="submit">
                    <Show when={props.initial} fallback={<>Create</>}>
                        Update
                    </Show>
                </button>
            </div>
        </form>
    );
}

export default function UserEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function UserEditorButtons(props: { user: User }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(username, loading) =>
                    withQuery(
                        () => actions.users.delete.orThrow({ username }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.user.username}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()}>
                <UserEditor
                    initial={props.user}
                    submit={(username, administrator, loading) =>
                        withQuery(
                            () => actions.users.update.orThrow({ username, administrator }),
                            loading,
                            false,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
