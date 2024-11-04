import '@mantine/core/styles.css';
import {AppShell, Burger, Group, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {SearchBox} from "./components/searchbox.tsx";
import Flights from "./components/flights.tsx";
import {Luggage} from "lucide-react";

function App() {
    const [opened, {toggle}] = useDisclosure()
    return (
        <>
            <AppShell
                header={{height: 60}}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                    collapsed: {mobile: !opened},
                }}
                padding="md"
            >
                <AppShell.Header>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />

                    <Group h={"100%"} pl={"md"}>
                        <Luggage size={30}/>
                        <Title order={1}>gmmz.dev // flights</Title>
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <SearchBox/>
                </AppShell.Navbar>

                <AppShell.Main><Flights/></AppShell.Main>
            </AppShell>
        </>
    )
}

export default App
