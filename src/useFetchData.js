import { useRef, useState } from "react";

export default function useFetchData(limitNumber, get,initCount, snapHandler, name) {
	const limit = useRef(0);
	const dataUnsub = useRef();
	const [data, setData] = useState(null);
	const snapCount = useRef(0);

	return [data, function fetchData(setScrollFetch) {
		if (limit.current || limit.current === 0) {
            if (limit.current === "limit attended") {
                setScrollFetch(false);
                limit.current = null;
            } else {
                setScrollFetch(true);
                limit.current = limit.current + limitNumber;
            };
            if (dataUnsub.current) {
                dataUnsub.current();
            };
            if (initCount) {
            	snapCount.current = 0;
            };
            let timeout = null;
            const getData = limit.current ? get.limit(limit.current) : get;
            dataUnsub.current = getData.onSnapshot(snapshot => {
                snapCount.current++;
                const s = () => {
                    const arr = snapHandler(snapshot);
                    setData(arr);
                    setScrollFetch(false);
                    if ((name === "users" && arr.length < limit.current - 1) || (name !== "users" && arr.length < limit.current)) {
                        limit.current = "limit attended";
                        fetchData(setScrollFetch)
                    };
                };
                if (snapshot.docs?.length > 0) {
                    if (snapCount.current >= 2) {
                    	if (timeout) {
                    		clearTimeout(timeout);
                    		timeout = null;
                    	}
                    	s();
                    } else {
                    	timeout = setTimeout(s, 1500)
                    };
                } else if (snapshot.docs?.length === 0) {
                    setData([]);
                    setScrollFetch(false);
                };
            });
        };
        return dataUnsub;
	}, setData];
};