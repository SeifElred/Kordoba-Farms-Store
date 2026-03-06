export type OrderListItem =
  | {
      type: "cart";
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string | null;
      country: string;
      locale: string;
      totalCents: number;
      paymentStatus: string;
      createdAt: string;
      itemCount: number;
    }
  | {
      type: "single";
      id: string;
      name: string;
      email: string;
      phone: string;
      totalPrice: number;
      paymentStatus: string;
      orderStatus: string;
      createdAt: string;
      purpose: string;
    };

export type CartOrderDetail = {
  type: "cart";
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  country: string;
  locale: string;
  totalCents: number;
  paymentStatus: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  items: unknown;
  createdAt: string;
  updatedAt: string;
};

export type SingleOrderDetail = {
  type: "single";
  id: string;
  userId: string;
  animalId: string;
  purpose: string;
  city: string | null;
  slaughterDate: string;
  distributionType: string;
  totalPrice: number;
  paymentStatus: string;
  orderStatus: string;
  certificateUrl: string | null;
  videoProofUrl: string | null;
  nameTag: string | null;
  videoProofOpt: boolean;
  weightSelection: string | null;
  specialCut: string | null;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string; country: string };
  animal?: { tagNumber: string; productType: string; weight: number; status: string };
};
