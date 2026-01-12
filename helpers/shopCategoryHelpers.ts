// Groceries
// Fast Food
// Restaurants
// Transport
// Fuel
// Electronics
// Fashion
// Health & Beauty
// Home & Garden
// Entertainment
// Pharmacy
// Coffee & Bakery
// Sports
// Books & Media
// Online Shopping
export const getShopIcon = (shopCategory: string) => {
    switch (shopCategory) {
        case 'Groceries':
            return 'cart'
        case 'Fast Food':
            return 'takeoutbag.and.cup.and.straw'
        case 'Restaurants':
            return 'fork.knife'
        case 'Transport':
            return 'car'
        case 'Fuel':
            return 'fuelpump'
        case 'Electronics':
            return 'tv'
        case 'Fashion':
            return 'tshirt'
        case 'Health & Beauty':
            return 'heart';
        case 'Home & Garden':
            return 'house'
        case 'Entertainment':
            return 'popcorn'
        case 'Pharmacy':
            return 'pill'
        case 'Coffee & Bakery':
            return 'cup.and.heat.waves'
        case 'Sports':
            return 'basketball'
        case 'Books & Media':
            return 'book'
        case 'Online Shopping':
            return 'creditcard'
    }
}