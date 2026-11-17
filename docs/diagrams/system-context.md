# Community Parking Management System — C4 System Context

```mermaid
C4Context
  title Community Parking Management System — System Context

  Person(resident, "Resident", "Creates an account, registers for a parking raffle, and views assignments and history.")
  Person(admin, "Administrator", "Reviews residents and parking spots, and runs raffles for the current cycle.")
  System(parking, "Community Parking Management System", "Manages resident accounts, quarterly parking raffles, results, and parking assignments.")

  Rel(resident, parking, "Registers for raffles and views parking information", "Web browser / HTTPS")
  Rel(admin, parking, "Reviews records and runs the current-cycle raffle", "Web browser / HTTPS")
```

The diagram shows the system as a single boundary from each user's perspective. Its web application, API, and database are internal parts of the system and are expanded in the [C4 container diagram](container-diagram.md). External services are omitted until selected; an email provider may be added for password recovery.
