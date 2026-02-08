import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Verify user is authenticated and is a landlord
    if (!session || !session.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { availabilityStatus, activate, publish, saveAsDraft, requestFeature, requestPin } = await req.json();

    // Validate availability status if provided
    if (availabilityStatus) {
      const validStatuses = ["AVAILABLE", "UNAVAILABLE", "PENDING_RENT"];
      if (!validStatuses.includes(availabilityStatus)) {
        return NextResponse.json(
          { error: "Invalid availability status" },
          { status: 400 }
        );
      }
    }

    // Find the property and verify ownership
    const property = await prisma.property.findUnique({
      where: { id },
      select: { landlordId: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this property" },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    
    if (availabilityStatus) {
      updateData.availabilityStatus = availabilityStatus;
      // Also update the boolean available field for backwards compatibility
      updateData.available = availabilityStatus === "AVAILABLE";
    }

    if (activate === true) {
      updateData.status = "ACTIVE";
    }

    // Publish for admin review (landlord intent)
    if (publish === true) {
      updateData.status = "PENDING";
    }

    // Save as draft
    if (saveAsDraft === true) {
      updateData.status = "DRAFT";
    }

    if (requestFeature !== undefined) {
      updateData.featureRequested = Boolean(requestFeature);
      updateData.featureRequestedAt = requestFeature ? new Date() : null;
    }

    if (requestPin !== undefined) {
      updateData.pinRequested = Boolean(requestPin);
      updateData.pinRequestedAt = requestPin ? new Date() : null;
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        availabilityStatus: true,
        available: true,
        featureRequested: true,
        featureRequestedAt: true,
        pinRequested: true,
        pinRequestedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error("Error updating property status:", error);
    return NextResponse.json(
      { error: "Failed to update property status" },
      { status: 500 }
    );
  }
}
