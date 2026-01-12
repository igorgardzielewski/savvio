import {Transaction, TransactionCategoriesGroups, transactionList} from "@/types";

export const sortReceipts = (receipts: Transaction[], sortBy: 'date' | 'amount' | 'shop', order: 'asc' | 'desc' = 'desc') => {
    const sorted = [...receipts].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'date':
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                comparison = dateA.getTime() - dateB.getTime();
                break;

            case 'amount':
                comparison = a.amount - b.amount;
                break;

            case 'shop':
                comparison = a.shop.name.localeCompare(b.shop.name);
                break;
        }

        return order === 'asc' ? comparison : -comparison;
    });
    return sorted;
}
export const getUserCategories = (transactionLists: transactionList): TransactionCategoriesGroups[] => {
    let returnArray: TransactionCategoriesGroups[] = [];
    let userSpent: number = 0;
    Object.entries(transactionLists).forEach(([_, transactions]) => {
        transactions.forEach((transaction) => {
            userSpent += transaction.amount;

            const existingCategory = returnArray.find((cat) => cat.categoryName === transaction.shop.categoryName);

            if (existingCategory) {
                existingCategory.spent += transaction.amount;
            } else {
                const newCategory: TransactionCategoriesGroups = {
                    categoryName: transaction.shop.categoryName,
                    spent: transaction.amount,
                    percentageInAllSpents: 0,
                    categoryColor: transaction.shop.categoryColor
                }
                returnArray.push(newCategory);
            }
        });
    });
    returnArray.forEach((category) => {
        category.percentageInAllSpents = (category.spent / userSpent) * 100;
    });

    return returnArray;
}