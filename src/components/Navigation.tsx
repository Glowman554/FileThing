import Navigation, { Entry, Home } from '@glowman554/base-components/src/generic/Navigation';

export default function () {
    return (
        <Navigation>
            <Home href="/">Home</Home>
            <Entry href="/projects">Projects</Entry>
            <Entry href="/users">Users</Entry>
            <Entry href="/me">Profile</Entry>
        </Navigation>
    );
}
