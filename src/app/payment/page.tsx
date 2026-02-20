import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, DollarSign } from "lucide-react";

async function getActivePaymentButtons() {
  return await prisma.paymentButton.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PaymentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const paymentButtons = await getActivePaymentButtons();

  const handlePayment = async (buttonId: string) => {
    "use server";
    const button = await prisma.paymentButton.findUnique({ where: { id: buttonId } });
    if (!button) return;

    const reference = `TWC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: button.amount,
        currency: button.currency,
        status: "pending",
        reference,
      },
    });

    const amountInKobo = button.currency === "NGN" ? button.amount * 100 : button.amount * 100;
    const paystackUrl = `https://checkout.paystack.com/p/${reference}?amount=${amountInKobo}`;
    
    return paystackUrl;
  };

  return (
    <div className="min-h-screen pt-20 py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Make a Payment</h1>
            <p className="text-slate-400">
              Choose a payment option below to complete your transaction
            </p>
          </div>

          {paymentButtons.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 rounded-xl">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400">No payment options available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentButtons.map((button) => (
                <div
                  key={button.id}
                  className="bg-slate-800 rounded-xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-700 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{button.name}</h3>
                      {button.description && (
                        <p className="text-slate-400 text-sm mt-1">{button.description}</p>
                      )}
                      <p className="text-indigo-400 font-bold text-xl mt-2">
                        {button.currency === "NGN" ? "₦" : "$"}{button.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <form action={async () => {
                    "use server";
                    const url = await handlePayment(button.id);
                    if (url) {
                      // Redirect would happen here
                    }
                  }}>
                    <button
                      type="submit"
                      style={{ backgroundColor: button.buttonColor }}
                      className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      {button.buttonText}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Payments are securely processed by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
