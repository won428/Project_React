import React, { useMemo, useState } from "react";
import { UserContext } from "./UserContext";
function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const value = useMemo(() => ({ user, setUser }, [user, setUser]))

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
export default UserProvider;