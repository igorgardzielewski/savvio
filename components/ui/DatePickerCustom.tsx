import React, { useState } from 'react';
import { View, Text,StyleSheet} from 'react-native';
import { Picker } from '@react-native-picker/picker';
export const MONTHS = [
    { value: 0, label: 'January', short: 'Jan' },
    { value: 1, label: 'February', short: 'Feb' },
    { value: 2, label: 'March', short: 'Mar' },
    { value: 3, label: 'April', short: 'Apr' },
    { value: 4, label: 'May', short: 'May' },
    { value: 5, label: 'June', short: 'Jun' },
    { value: 6, label: 'July', short: 'Jul' },
    { value: 7, label: 'August', short: 'Aug' },
    { value: 8, label: 'September', short: 'Sep' },
    { value: 9, label: 'October', short: 'Oct' },
    { value: 10, label: 'November', short: 'Nov' },
    { value: 11, label: 'December', short: 'Dec' },
];
const generateYears = (start = 1900, end = 2100) => {
    return Array.from({ length: end - start + 1 }, (_, i) => ({
        value: start + i,
        label: String(start + i),
    }));
};
const DAYS_IN_MONTH = 31;
type InterfaceDatePickerCustomProps = {
    styleContainer?: object;
}
export const DatePickerCustom = ({styleContainer}:InterfaceDatePickerCustomProps) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedYear, setSelectedYear] = useState(2000);

    const years = generateYears(1900, 2100);
    return(
        <View style={styleContainer ? styleContainer : {borderWidth: 1, borderColor:'black', padding:32, width:'100%', borderRadius:24,display:"flex", flexDirection:"row"}}>
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>Month</Text>
                <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                    style={styles.picker}
                >

                </Picker>
            </View>
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>Month</Text>
                <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                    style={styles.picker}
                >
                    {MONTHS.map((month) => (
                        <Picker.Item
                            key={month.value}
                            label={month.short}
                            value={month.value}
                        />
                    ))}
                    {MONTHS.map((month) => (
                        <Picker.Item
                            key={month.value}
                            label={month.short}
                            value={month.value}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    pickerWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600',
    },
    picker: {
        width: '100%',
        height: 150,
    },
});