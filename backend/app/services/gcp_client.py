"""GCP client service for resource management"""
import os
from typing import List, Dict, Optional
from google.cloud import compute_v1
from google.cloud import storage
from datetime import datetime


class GCPClientService:
    """Service for interacting with GCP APIs"""

    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.region = os.getenv("GCP_REGION", "us-central1")

    async def list_compute_instances(self, zone: Optional[str] = None) -> List[Dict]:
        """List Compute Engine instances"""
        try:
            instances_client = compute_v1.InstancesClient()
            zone = zone or f"{self.region}-a"

            request = compute_v1.ListInstancesRequest(
                project=self.project_id,
                zone=zone
            )

            instances = []
            for instance in instances_client.list(request=request):
                instances.append({
                    "id": instance.name,
                    "name": instance.name,
                    "type": "compute-engine",
                    "status": instance.status.lower(),
                    "machine_type": instance.machine_type.split("/")[-1],
                    "zone": zone,
                    "created": instance.creation_timestamp
                })

            return instances

        except Exception as e:
            print(f"Error listing compute instances: {str(e)}")
            return []

    async def list_storage_buckets(self) -> List[Dict]:
        """List Cloud Storage buckets"""
        try:
            storage_client = storage.Client(project=self.project_id)
            buckets = []

            for bucket in storage_client.list_buckets():
                buckets.append({
                    "id": bucket.name,
                    "name": bucket.name,
                    "type": "cloud-storage",
                    "status": "running",
                    "location": bucket.location,
                    "storage_class": bucket.storage_class,
                    "created": bucket.time_created.isoformat() if bucket.time_created else None
                })

            return buckets

        except Exception as e:
            print(f"Error listing storage buckets: {str(e)}")
            return []

    async def get_project_resources(self) -> Dict:
        """Get all resources in the project"""
        resources = {
            "compute_instances": await self.list_compute_instances(),
            "storage_buckets": await self.list_storage_buckets(),
            "project_id": self.project_id,
            "region": self.region,
            "last_refresh": datetime.now().isoformat()
        }

        return resources

    def estimate_resource_cost(
        self,
        resource_type: str,
        config: Dict
    ) -> float:
        """
        Estimate monthly cost for a resource
        (Simplified estimation - in production, use GCP Pricing API)
        """
        cost_map = {
            "cloud-run": {
                "base": 0,
                "per_million_requests": 0.40,
                "cpu_per_hour": 0.00002400,
                "memory_per_gb_hour": 0.00000250
            },
            "compute-engine": {
                "e2-micro": 6.11,
                "e2-small": 12.23,
                "e2-medium": 24.45,
                "n1-standard-1": 24.27,
                "n1-standard-2": 48.54
            },
            "cloud-sql": {
                "db-f1-micro": 7.67,
                "db-g1-small": 25.00,
                "db-n1-standard-1": 56.00
            },
            "cloud-storage": {
                "standard": 0.020,  # per GB
                "nearline": 0.010,
                "coldline": 0.004
            }
        }

        if resource_type == "cloud-run":
            # Simplified calculation
            return 10.0  # Estimate based on light usage

        elif resource_type == "compute-engine":
            instance_type = config.get("instance_type", "e2-micro")
            return cost_map["compute-engine"].get(instance_type, 10.0)

        elif resource_type == "cloud-sql":
            tier = config.get("tier", "db-f1-micro")
            return cost_map["cloud-sql"].get(tier, 10.0)

        elif resource_type == "cloud-storage":
            storage_gb = config.get("storage_gb", 10)
            storage_class = config.get("storage_class", "standard")
            return storage_gb * cost_map["cloud-storage"].get(storage_class, 0.020)

        return 0.0


# Singleton instance
_gcp_client_service: Optional[GCPClientService] = None


def get_gcp_client_service() -> GCPClientService:
    """Get or create the GCP client service singleton"""
    global _gcp_client_service
    if _gcp_client_service is None:
        _gcp_client_service = GCPClientService()
    return _gcp_client_service
