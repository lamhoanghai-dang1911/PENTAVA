import { taskService } from "@/src/services/taskService";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type RoutineTodayCardProps = {
    goalId: number | null;
    message?: string;
};

export default function RoutineTodayCard({
    goalId,
    message = "Bạn đã làm rất tốt",
}: RoutineTodayCardProps) {

    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!goalId) return;

        let isMounted = true;

        taskService
            .getDailyTaskStatus(goalId)
            .then((response) => {
                if (!isMounted) return;
                const tasks = response.dailyTaskStatus?.todayTasks ?? [];
                setTotal(tasks.length);
                setCompleted(tasks.filter((task) => task.isCompleted).length);
            })
            .catch(() => {
                if (!isMounted) return;
                setTotal(0);
                setCompleted(0);
            });

        return () => {
            isMounted = false;
        };
    }, [goalId]);




    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Routine hôm nay</Text>
                <Text style={styles.headerIcon}>🌱</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.completed}>{completed}</Text>
                <Text style={styles.slash}>/</Text>
                <Text style={styles.total}>{total}</Text>
                <Text style={styles.taskLabel}> Task</Text>
            </View>

            <Text style={styles.message}>{message}</Text>
        </View>
    );

}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    headerText: {
        fontSize: 13,
        color: "#6B7280",
    },
    headerIcon: {
        fontSize: 13,
    },
    row: {
        flexDirection: "row",
        alignItems: "baseline",
        marginTop: 4,
    },
    completed: {
        fontSize: 28,
        fontWeight: "800",
        color: "#059669",
    },
    slash: {
        fontSize: 28,
        fontWeight: "800",
        color: "#D1D5DB",
    },
    total: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1F2937",
    },
    taskLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginLeft: 2,
    },
    message: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 4,
    },
});