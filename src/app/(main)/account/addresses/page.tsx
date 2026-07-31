
// /src/app/account/addresses/page.tsx (UPDATED TO USE DTO)

import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User, { IAddress } from "@/models/User";
import AddressClient from "@/app/features/storefront/customer-account/components/addresses/AddressClient";
import { ClientAddress } from "@/app/features/storefront/cart-checkout/actions/addressActions"; // <-- Import the new PLAIN type

// This function now returns an array of our safe, plain ClientAddress objects
async function getUserAddresses(userId: string): Promise<ClientAddress[]> {
  try {
    await connectMongoose();

    const user = await User.findById(userId)
      .select("addresses")
      .lean<{ addresses?: IAddress[] }>();

    if (!user || !user.addresses) {
      return [];
    }

    // Manually map/convert the array of Mongoose sub-documents to plain ClientAddress objects.
    // This is the "plating the dish" step.
    const plainAddresses: ClientAddress[] = user.addresses.map((addr) => ({
      _id: addr._id.toString(),
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      area: addr.area,
      address: addr.address,
      isDefault: addr.isDefault,
      lat: addr.lat || null,
      lng: addr.lng || null,
    }));

    return plainAddresses;
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    return [];
  }
}

// === Main Page Component (Server Component) ===
export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  // The 'addresses' variable is now a clean array of ClientAddress objects
  const addresses = await getUserAddresses(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <MapPin size={24} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Address Book
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your saved shipping addresses for a faster checkout.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {/* We are now passing safe, plain data to the Client Component */}
        <AddressClient initialAddresses={addresses} />
      </div>
    </div>
  );
}
