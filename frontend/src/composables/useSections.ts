import { useEffect, useState } from "react";
import { Section } from "../types";
import api from "../services/api";

export default function useSections() {
    const [sections, setSections] = useState<Section[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchSections = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Section[]>('/sections');
            setSections(data);
            console.log(data);
            console.log("Sections fetched successfully");
        }
            catch (error) {
                console.log(error);
                setError("Failed to fetch sections");
            }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
            fetchSections();
        }, []);
    
    return { sections, fetchSections, loading, error };
}
