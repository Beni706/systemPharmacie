"use client"


import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Phone, Filter, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import PharmacyMap from "./pharmacy-map"

export default function PharmacyFinder() {
  const [showRoutes, setShowRoutes] = useState(false)
  const [pharmacies, setPharmacies] = useState([])
  const [nearbyPharmacies, setNearbyPharmacies] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    openNow: false,
    onDuty: false,
  })
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [geoError, setGeoError] = useState(null)

  // Récupérer les données des pharmacies
  useEffect(() => {
    async function fetchPharmacies() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`)
        const data = await response.json()
        setPharmacies(data)
        setNearbyPharmacies(data)
        setIsLoading(false)
        
      } catch (error) {
        console.error("Erreur lors de la récupération des pharmacies:", error)
        setIsLoading(false)
      }
    }

    fetchPharmacies()
  }, [])

  // Fonction pour localiser l'utilisateur
  const locateUser = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      setGeoError(null)
      setShowRoutes(true)


      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          setUserLocation(userLoc)

          // Récupérer les pharmacies proches
          try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/pharmacie/proche?latitude=${userLoc.lat.toFixed(6)}&longitude=${userLoc.lng.toFixed(6)}`
            const response = await fetch(url)
            const data = await response.json()
            setNearbyPharmacies(data)
            setShowRoutes(true) // 👉 Affiche les itinéraires automatiquement
            
            // ✅ Sélection automatique de la pharmacie la plus proche
            if (data.length > 0) {
              setSelectedPharmacy(data[0])
            }
            
          } catch (error) {
            console.error("Erreur lors de la récupération des pharmacies proches:", error)
          } finally {
            setIsLoading(false)
          }
          
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error)
          setGeoError("Impossible d'obtenir votre position.")
          setIsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      )
    } else {
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.")
    }
  }

  // Effectuer un suivi actif toutes les 2 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      locateUser()
    }, 120000) // 2 minutes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId)
  }, [])

  const filteredPharmacies = nearbyPharmacies
    .filter(
      (pharmacy) =>
        pharmacy.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.adresse.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((pharmacy) => {
      if (filters.openNow && !pharmacy.isOpen) return false
      if (filters.onDuty && !pharmacy.isOnDuty) return false
      return true
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="order-1 lg:order-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une pharmacie..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
            onClick={locateUser}
            disabled={isLoading}
          >
            <Navigation className="h-4 w-4" />
            {isLoading ? "Localisation..." : "Près de moi"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtres</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>Filtrer les pharmacies selon vos besoins</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-now"
                    checked={filters.openNow}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, openNow: checked === true }))}
                  />
                  <Label htmlFor="open-now">Ouvertes maintenant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="on-duty"
                    checked={filters.onDuty}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, onDuty: checked === true }))}
                  />
                  <Label htmlFor="on-duty">Pharmacies de garde</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {geoError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{geoError}</div>}

        <div className="h-[500px] overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Chargement des pharmacies...</p>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>Aucune pharmacie trouvée</p>
            </div>
          ) : (
            filteredPharmacies.map((pharmacy) => (
              <Card
                key={pharmacy.id_pharmacie}
                className={`cursor-pointer hover:border-emerald-500 transition-colors ${
                  selectedPharmacy?.id_pharmacie === pharmacy.id_pharmacie ? "border-emerald-500" : ""
                }`}
                onClick={() => setSelectedPharmacy(pharmacy)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{pharmacy.nom}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {pharmacy.adresse}
                      </p>
                      {pharmacy.telephone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" /> {pharmacy.telephone}
                        </p>
                      )}
                      {pharmacy.isOpen !== undefined && (
                        <p className="text-sm flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span className={pharmacy.isOpen ? "text-emerald-600" : "text-red-500"}>
                            {pharmacy.isOpen ? "Ouvert" : "Fermé"}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {pharmacy.distance !== undefined && (
                        <Badge variant="outline" className="bg-emerald-50">
                          {pharmacy.distance.toFixed(2)} km
                        </Badge>
                      )}
                      {pharmacy.isOnDuty && <Badge className="bg-emerald-600">De garde</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="order-2 lg:order-2 h-[300px] lg:h-[500px]">
        <PharmacyMap
          pharmacies={filteredPharmacies}
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          onPharmacySelect={setSelectedPharmacy}
          showRoutes={showRoutes}
        />
      </div>
    </div>
  )
}
