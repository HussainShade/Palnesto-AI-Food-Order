import { PrismaClient, Ingredient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  const admin = await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create ingredients
  const ingredientsData = [
    { name: 'Basmati Rice', quantity: 100, threshold: 20, unit: 'kg' },
    { name: 'Chicken', quantity: 50, threshold: 10, unit: 'kg', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { name: 'Paneer', quantity: 40, threshold: 8, unit: 'kg', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { name: 'Tomato', quantity: 30, threshold: 5, unit: 'kg', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    { name: 'Onion', quantity: 25, threshold: 5, unit: 'kg', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { name: 'Garam Masala', quantity: 5, threshold: 1, unit: 'kg' },
    { name: 'Turmeric Powder', quantity: 3, threshold: 0.5, unit: 'kg' },
    { name: 'Cumin Seeds', quantity: 2, threshold: 0.3, unit: 'kg' },
    { name: 'Coriander Powder', quantity: 3, threshold: 0.5, unit: 'kg' },
    { name: 'Yogurt', quantity: 20, threshold: 5, unit: 'kg', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { name: 'Ghee', quantity: 15, threshold: 3, unit: 'kg' },
    { name: 'Chickpeas', quantity: 30, threshold: 5, unit: 'kg' },
    { name: 'All Purpose Flour', quantity: 50, threshold: 10, unit: 'kg' },
    { name: 'Black Lentils', quantity: 25, threshold: 5, unit: 'kg' },
    { name: 'Spinach', quantity: 15, threshold: 3, unit: 'kg', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { name: 'Ginger Garlic Paste', quantity: 10, threshold: 2, unit: 'kg', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { name: 'Red Chili Powder', quantity: 2, threshold: 0.3, unit: 'kg' },
    { name: 'Cardamom', quantity: 1, threshold: 0.2, unit: 'kg' },
    { name: 'Cinnamon', quantity: 1, threshold: 0.2, unit: 'kg' },
    { name: 'Bay Leaves', quantity: 0.5, threshold: 0.1, unit: 'kg' },
    { name: 'Potato', quantity: 40, threshold: 8, unit: 'kg', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { name: 'Milk', quantity: 30, threshold: 6, unit: 'L', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { name: 'Sugar', quantity: 20, threshold: 4, unit: 'kg' },
    { name: 'Tea Leaves', quantity: 2, threshold: 0.5, unit: 'kg' },
    { name: 'Mango Pulp', quantity: 15, threshold: 3, unit: 'kg', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { name: 'Lemon', quantity: 10, threshold: 2, unit: 'kg', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { name: 'Green Chilies', quantity: 2, threshold: 0.5, unit: 'kg', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { name: 'Cabbage', quantity: 12, threshold: 3, unit: 'kg', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    { name: 'Carrot', quantity: 8, threshold: 2, unit: 'kg', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { name: 'Bell Pepper', quantity: 6, threshold: 1.5, unit: 'kg', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
  ];

  const ingredients: Ingredient[] = [];
  for (const ing of ingredientsData) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: ing,
    });
    ingredients.push(ingredient);
  }

  console.log(`✅ Created ${ingredients.length} ingredients`);

  // Create food items
  const foodItemsData = [
    {
      name: 'Chicken Biryani',
      price: 399.99,
      description: 'Fragrant basmati rice cooked with tender chicken, aromatic spices, and herbs',
      image: 'https://i.postimg.cc/N09VkRKw/chicken-briyani.jpg',
      ingredients: [
        { name: 'Basmati Rice', qty: 0.3 },
        { name: 'Chicken', qty: 0.2 },
        { name: 'Onion', qty: 0.05 },
        { name: 'Tomato', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Yogurt', qty: 0.05 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Cardamom', qty: 0.002 },
        { name: 'Cinnamon', qty: 0.002 },
        { name: 'Bay Leaves', qty: 0.001 },
      ],
    },
    {
      name: 'Paneer Biryani',
      price: 349.99,
      description: 'Delicious biryani with soft paneer cubes, basmati rice, and aromatic spices',
      image: 'https://i.postimg.cc/Y03yC3sf/palak-briyani.jpg',
      ingredients: [
        { name: 'Basmati Rice', qty: 0.3 },
        { name: 'Paneer', qty: 0.15 },
        { name: 'Onion', qty: 0.05 },
        { name: 'Tomato', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Yogurt', qty: 0.05 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Cardamom', qty: 0.002 },
        { name: 'Cinnamon', qty: 0.002 },
      ],
    },
    {
      name: 'Butter Chicken',
      price: 359.99,
      description: 'Creamy tomato-based curry with tender chicken pieces, rich and flavorful',
      image: 'https://i.postimg.cc/fWps4TNh/butter-chicken.jpg',
      ingredients: [
        { name: 'Chicken', qty: 0.25 },
        { name: 'Tomato', qty: 0.1 },
        { name: 'Onion', qty: 0.05 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Red Chili Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Yogurt', qty: 0.05 },
        { name: 'Ghee', qty: 0.03 },
        { name: 'Coriander Powder', qty: 0.01 },
      ],
    },
    {
      name: 'Paneer Tikka Masala',
      price: 329.99,
      description: 'Grilled paneer cubes in a creamy, spiced tomato gravy',
      image: 'https://i.postimg.cc/XvCHC3PG/Paneer-Tikka-Masala.jpg',
      ingredients: [
        { name: 'Paneer', qty: 0.2 },
        { name: 'Tomato', qty: 0.1 },
        { name: 'Onion', qty: 0.05 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Red Chili Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Yogurt', qty: 0.05 },
        { name: 'Ghee', qty: 0.03 },
        { name: 'Cumin Seeds', qty: 0.003 },
      ],
    },
    {
      name: 'Dal Makhani',
      price: 199.99,
      description: 'Creamy black lentils slow-cooked with butter, cream, and aromatic spices',
      image: 'https://i.postimg.cc/sxwwr2Mm/dal-makhani.jpg',
      ingredients: [
        { name: 'Black Lentils', qty: 0.15 },
        { name: 'Chickpeas', qty: 0.05 },
        { name: 'Tomato', qty: 0.05 },
        { name: 'Onion', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Ginger Garlic Paste', qty: 0.01 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Red Chili Powder', qty: 0.003 },
        { name: 'Cumin Seeds', qty: 0.002 },
      ],
    },
    {
      name: 'Chole Bhature',
      price: 169.99,
      description: 'Spicy chickpea curry served with fluffy deep-fried bread',
      image: 'https://i.postimg.cc/YqDbDhKQ/chole-bature.jpg',
      ingredients: [
        { name: 'Chickpeas', qty: 0.2 },
        { name: 'All Purpose Flour', qty: 0.15 },
        { name: 'Tomato', qty: 0.05 },
        { name: 'Onion', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Red Chili Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.01 },
        { name: 'Ghee', qty: 0.03 },
        { name: 'Coriander Powder', qty: 0.01 },
      ],
    },
    {
      name: 'Samosa',
      price: 49.99,
      description: 'Crispy fried pastry filled with spiced potatoes and peas',
      image: 'https://i.postimg.cc/0QvfKSDq/Samosa.jpg',
      ingredients: [
        { name: 'All Purpose Flour', qty: 0.1 },
        { name: 'Onion', qty: 0.02 },
        { name: 'Garam Masala', qty: 0.005 },
        { name: 'Cumin Seeds', qty: 0.003 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Red Chili Powder', qty: 0.002 },
      ],
    },
    {
      name: 'Naan Bread',
      price: 65.99,
      description: 'Soft, fluffy Indian flatbread baked in tandoor, brushed with butter',
      image: 'https://i.postimg.cc/sx69L08y/naan-bread.jpg',
      ingredients: [
        { name: 'All Purpose Flour', qty: 0.15 },
        { name: 'Yogurt', qty: 0.03 },
        { name: 'Ghee', qty: 0.01 },
      ],
    },
    {
      name: 'Tandoori Chicken',
      price: 429.99,
      description: 'Marinated chicken grilled to perfection with yogurt and spices',
      image: 'https://i.postimg.cc/ncr1mpjC/Tandoori-Chicken.jpg',
      ingredients: [
        { name: 'Chicken', qty: 0.3 },
        { name: 'Yogurt', qty: 0.08 },
        { name: 'Ginger Garlic Paste', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Red Chili Powder', qty: 0.008 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Coriander Powder', qty: 0.01 },
      ],
    },
    {
      name: 'Palak Paneer',
      price: 299.99,
      description: 'Creamy spinach curry with soft paneer cubes, rich and nutritious',
      image: 'https://i.postimg.cc/0NRGhSty/palak-paneer.jpg',
      ingredients: [
        { name: 'Paneer', qty: 0.18 },
        { name: 'Spinach', qty: 0.2 },
        { name: 'Tomato', qty: 0.05 },
        { name: 'Onion', qty: 0.03 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Cumin Seeds', qty: 0.003 },
        { name: 'Red Chili Powder', qty: 0.003 },
      ],
    },
    {
      name: 'Paneer Tikka',
      price: 249.99,
      description: 'Marinated paneer cubes grilled to perfection, served with mint chutney',
      image: 'https://i.postimg.cc/brgHdDX3/paneer-tikka.jpg',
      ingredients: [
        { name: 'Paneer', qty: 0.2 },
        { name: 'Yogurt', qty: 0.05 },
        { name: 'Ginger Garlic Paste', qty: 0.02 },
        { name: 'Garam Masala', qty: 0.01 },
        { name: 'Turmeric Powder', qty: 0.005 },
        { name: 'Red Chili Powder', qty: 0.005 },
        { name: 'Ghee', qty: 0.02 },
        { name: 'Lemon', qty: 0.01 },
        { name: 'Bell Pepper', qty: 0.05 },
        { name: 'Onion', qty: 0.03 },
      ],
    },
    {
      name: 'Aloo Tikki',
      price: 89.99,
      description: 'Crispy potato patties spiced with herbs, served with chutneys',
      image: 'https://i.postimg.cc/PJQKZVDR/aloo-tikki.jpg',
      ingredients: [
        { name: 'Potato', qty: 0.15 },
        { name: 'Onion', qty: 0.02 },
        { name: 'Garam Masala', qty: 0.005 },
        { name: 'Cumin Seeds', qty: 0.003 },
        { name: 'Red Chili Powder', qty: 0.003 },
        { name: 'Ginger Garlic Paste', qty: 0.01 },
        { name: 'Ghee', qty: 0.03 },
        { name: 'Green Chilies', qty: 0.002 },
        { name: 'Coriander Powder', qty: 0.005 },
      ],
    },
    {
      name: 'Mango Lassi',
      price: 79.99,
      description: 'Refreshing sweet yogurt drink with fresh mango pulp, creamy and delicious',
      image: 'https://i.postimg.cc/rwKCFwfH/mango-lassi.jpg',
      ingredients: [
        { name: 'Yogurt', qty: 0.15 },
        { name: 'Mango Pulp', qty: 0.1 },
        { name: 'Sugar', qty: 0.02 },
        { name: 'Milk', qty: 0.05 },
      ],
    },
    {
      name: 'Masala Chai',
      price: 49.99,
      description: 'Aromatic spiced tea with milk, cardamom, and ginger - perfect comfort drink',
      image: 'https://i.postimg.cc/5N9ST3Ld/masala-chai.jpg',
      ingredients: [
        { name: 'Tea Leaves', qty: 0.005 },
        { name: 'Milk', qty: 0.1 },
        { name: 'Sugar', qty: 0.01 },
        { name: 'Cardamom', qty: 0.001 },
        { name: 'Ginger Garlic Paste', qty: 0.002 },
        { name: 'Cinnamon', qty: 0.001 },
      ],
    },
    {
      name: 'Vegetable Spring Rolls',
      price: 119.99,
      description: 'Crispy rolls filled with fresh vegetables, served with sweet and sour sauce',
      image: 'https://i.postimg.cc/25LwTSvk/vegetable-spring-rolls.jpg',
      ingredients: [
        { name: 'All Purpose Flour', qty: 0.1 },
        { name: 'Cabbage', qty: 0.08 },
        { name: 'Carrot', qty: 0.05 },
        { name: 'Bell Pepper', qty: 0.03 },
        { name: 'Onion', qty: 0.02 },
        { name: 'Ginger Garlic Paste', qty: 0.01 },
        { name: 'Garam Masala', qty: 0.003 },
        { name: 'Ghee', qty: 0.03 },
        { name: 'Green Chilies', qty: 0.002 },
      ],
    },
  ];

  for (const food of foodItemsData) {
    const foodItem = await prisma.foodItem.upsert({
      where: { name: food.name },
      update: {},
      create: {
        name: food.name,
        price: food.price,
        description: food.description,
        image: food.image,
        ingredients: {
          create: food.ingredients.map((ing) => {
            const ingredient = ingredients.find((i) => i.name === ing.name);
            if (!ingredient) {
              throw new Error(`Ingredient ${ing.name} not found`);
            }
            return {
              ingredientId: ingredient.id,
              qtyRequired: ing.qty,
            };
          }),
        },
      },
    });
    console.log(`✅ Created food item: ${foodItem.name}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

